"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function WithdrawComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    data: minnerWithdrawalData,
    error: minnerWithdrawalError,
    isLoading: minnerWithdrawalIsLoading,
    isFetching: minnerWithdrawalIsFetching,
    refetch: minnerWithdrawalRefetch,
  } = useQuery({
    queryKey: ["minnerWithdrawal"],
    queryFn: async () => {
      const res = await fetch("api/v1/getWithdrawal");
      let data = await res.json();
      if (data.code == 401) {
        toast.error("Login first to access this page");
        router.push("/login");
        return;
      }
      return data;
    },
  });
  const withdraw_mutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      const res = await fetch("api/v1/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency_id: data,
        }),
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.code == 200) {
        setIsSubmitting(false);
        minnerWithdrawalRefetch();
        toast.success(data.message);
      } else if (data.code == 401) {
        toast.error("Login first to access this page");
        router.push("/login");
        return;
      } else {
        setIsSubmitting(false);
        toast.error(data.message);
      }
    },
    onError(error: any) {
      setIsSubmitting(false);
      toast.error(error);
    },
  });
  return (
    <>
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold text-center mt-4">Payout List</h2>
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>Currency Name</th>
              <th>Currency Code</th>
              <th>Per Hash</th>
              <th>Rate</th>
              <th>Current Balance Conversion(Satoshi)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {minnerWithdrawalData?.data.currency.map(
              (data: any, index: number) => (
                <tr key={index}>
                  <th>{index + 1}</th>
                  <td>{data.currency_name}</td>
                  <td>{data.currency_code}</td>
                  <td>{data.per_hash} Hash</td>
                  <td>{data.rate} Satoshi</td>
                  <td>
                    {(
                      Number(data.rate) *
                      Number(
                        minnerWithdrawalData.data.users.balance /
                          Number(data.per_hash)
                      )
                    ).toFixed(8)}{" "}
                    Satoshi
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        withdraw_mutation.mutate(data.id);
                      }}
                      className={`btn ${
                        isSubmitting ? "btn-disabled btn-sm" : "btn-info btn-sm"
                      }`}
                    >
                      Widthraw
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
