"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function MinnerTransactionTable() {
  const router = useRouter();
  const [transactionPage, setTransactionPage] = useState(0);
  const { data, error, isLoading, isError, isFetching } = useQuery({
    queryKey: ["transactions", transactionPage],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/getMinnerTransaction/?page=${transactionPage}`
      );
      const data = await response.json();
      if(data.code == 401){
        toast.error("Login first to access this page");
        router.push("/login");
        throw new Error("Login first to access this page");
      }else if (data.code == 200) {
        return data;
      } else {
        throw new Error("Error in retrieving announcements.");
      }
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
  return (
    <div className="overflow-x-auto flex flex-col">
      <h2 className="text-2xl font-bold text-center mt-4">
        Latest Payout Record
      </h2>
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Payout ID</th>
            <th>Currency</th>
            <th>Amount(Satoshi)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <>
              <tr>
                <td colSpan={6} className="text-center">
                  <div className="loader" /> Loading...
                </td>
              </tr>
            </>
          ) : isError ? (
            <tr>
              <td colSpan={6}>Error: {error.message}</td>
            </tr>
          ) : data.data == null ? (
            <></>
          ) : (
            data.data.map((transaction: any, index: number) => (
              <tr key={index}>
                <td>{transaction.id}</td>
                <td>
                  {DateTime.fromISO(transaction.created_at).toFormat(
                    "EEEE, MMMM d, yyyy"
                  )}
                </td>
                <td>{transaction.payout_id}</td>
                <td>{transaction.currency_code}</td>
                <td>{transaction.amount}</td>
                <td>
                  {transaction.status == 200
                    ? "Sent"
                    : transaction.status == 202
                    ? "Pending"
                    : "Denied"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="join mx-auto my-4">
        <button
          onClick={async () => {
            const newPage = transactionPage - 1;
            if (transactionPage > 0) {
              await setTransactionPage(newPage);
            }
          }}
          className="join-item btn"
        >
          «
        </button>
        <button className="join-item btn">Page {transactionPage + 1}</button>
        <button
          onClick={async () => {
            if (data.data.length === 10) {
              const newPage = transactionPage + 1;
              await setTransactionPage(newPage);
            } else {
            }
          }}
          className="join-item btn"
        >
          »
        </button>
      </div>
    </div>
  );
}
