"use client";

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { DateTime } from "luxon";
import { Form, Formik, FormikHelpers, FormikValues } from "formik";
import LabeledInput from "./LabeledInput";
import Link from "next/link";
export default function MinnersStats() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modal = useRef<HTMLDialogElement>(null);
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["minnersStats"],
    queryFn: async () => {
      const res = await fetch("api/v1/getMinnersInformation");
      return res.json();
    },
  });
  const updateBalanceMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      let headersList = {
        Accept: "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      };

      let response = await fetch("/api/v1/getLatestBalance", {
        method: "POST",
        headers: headersList,
      });

      let data = await response.json();
      return data;
    },
    onSuccess: (data: any) => {
      new QueryClient().invalidateQueries({
        queryKey: ["minnersStats"],
      });
      if (data.code == 200) {
        setIsSubmitting(false);
        refetch();
        toast.success(data.message);
      } else {
        setIsSubmitting(false);
        toast.error(data.message);
      }
    },
    onError(error: any) {
      setIsSubmitting(false);
      toast.error(error.message);
    },
  });
  const getIsAllowedToFetchBalance = (specificDate: any) => {
    const date = DateTime.now();
    const dbDate = DateTime.fromISO(specificDate);
    const differenceInHours = date.diff(dbDate, "hours").hours;
    if (differenceInHours >= 24) {
      return true;
    } else {
      return false;
    }
  };
  return (
    <div className="stats mx-auto shadow">
      <div className="stat place-items-center">
        <div className="stat-title">Account Balance</div>
        <div className="stat-value">
          {isLoading || isFetching ? "..." : data.data.balance_hash.hashes}
          Hashes
        </div>
        <div className="stat-desc">
          Balance Updated Since on{" "}
          {isLoading || isFetching
            ? "..."
            : `${
                Number(
                  DateTime.now()
                    .diff(
                      DateTime.fromISO(data.data.balance_hash.date),
                      "hours"
                    )
                    .hours.toFixed(0)
                ) == 0
                  ? `${DateTime.now()
                      .diff(
                        DateTime.fromISO(data.data.balance_hash.date),
                        "seconds"
                      )
                      .seconds.toFixed(0)} Seconds ago`
                  : `${DateTime.now()
                      .diff(
                        DateTime.fromISO(data.data.balance_hash.date),
                        "hours"
                      )
                      .hours.toFixed(0)} Hours ago`
              }`}
        </div>
        <div className="stat-actions">
          <button
            onClick={() => {
              updateBalanceMutation.mutate();
            }}
            className={`btn mx-2  ${
              isLoading || isFetching
                ? "btn-sm btn-disabled"
                : data.data.balance_hash.date == "Not Available"
                ? "btn-sm "
                : !getIsAllowedToFetchBalance(data.data.balance_hash.date)
                ? "btn-sm btn-disabled"
                : isSubmitting
                ? "btn-sm btn-disabled"
                : "btn-sm"
            }`}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
          <Link href={"/withdraw"} className="btn mx-2 btn-sm">Withdraw</Link>
        </div>
      </div>
      <div className="stat place-items-center">
        <div className="stat-title">Overall Total Hashes</div>
        <div className="stat-value text-secondary">
          {isLoading || isFetching ? "..." : data.data.total_hashes.hashes}{" "}
          Hashes
        </div>
        <div className="stat-desc text-secondary">
          Latest Updated Since{" "}
          {isLoading || isFetching
            ? "..."
            : `${
                Number(
                  DateTime.now()
                    .diff(
                      DateTime.fromISO(data.data.balance_hash.date),
                      "hours"
                    )
                    .hours.toFixed(0)
                ) == 0
                  ? `${DateTime.now()
                      .diff(
                        DateTime.fromISO(data.data.balance_hash.date),
                        "seconds"
                      )
                      .seconds.toFixed(0)} Seconds ago`
                  : `${DateTime.now()
                      .diff(
                        DateTime.fromISO(data.data.balance_hash.date),
                        "hours"
                      )
                      .hours.toFixed(0)} Hours ago`
              }`}
        </div>
      </div>
      <div className="stat place-items-center">
        <div className="stat-title">Latest Withdrawal</div>
        <div className="stat-value">
          {isLoading || isFetching
            ? "..."
            : !data.data.latest_transaction
            ? "No Lates Withdrawal Found"
            : `${data.data.latest_transaction.hashes} Hashes`}
        </div>
        <div className="stat-desc">
          {isLoading || isFetching
            ? "..."
            : !data.data.latest_transaction
            ? ""
            : `${
                Number(
                  DateTime.now()
                    .diff(
                      DateTime.fromISO(data.data.latest_transaction.date),
                      "hours"
                    )
                    .hours.toFixed(0)
                ) == 0
                  ? `${DateTime.now()
                      .diff(
                        DateTime.fromISO(data.data.latest_transaction.date),
                        "seconds"
                      )
                      .seconds.toFixed(0)} Seconds ago`
                  : `${DateTime.now()
                      .diff(
                        DateTime.fromISO(data.data.latest_transaction.date),
                        "hours"
                      )
                      .hours.toFixed(0)} Hours ago`
              }`}
        </div>
      </div>
    </div>
  );
}
