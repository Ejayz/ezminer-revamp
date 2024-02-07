"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useState } from "react";

export default function TransactionTable() {
  const [transactionPage, setTransactionPage] = useState(0);
  const { data, error, isLoading, isError, isFetching } = useQuery({
    queryKey: ["transactions", transactionPage],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/getTransactions/?page=${transactionPage}`
      );
      return response.json();
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
  return (
    <div className="overflow-x-auto">
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
                <td colSpan={6} className="skeleton "></td>
              </tr>
              <tr>
                <td colSpan={6} className="skeleton "></td>
              </tr>
              <tr>
                <td colSpan={6} className="skeleton"></td>
              </tr>
              <tr>
                <td colSpan={6} className="skeleton"></td>
              </tr>
              <tr>
                <td colSpan={6} className="skeleton"></td>
              </tr>
              <tr>
                <td colSpan={6} className="skeleton"></td>
              </tr>
              <tr>
                <td colSpan={6} className="skeleton"></td>
              </tr>
              <tr>
                <td colSpan={6} className="skeleton"></td>
              </tr>
              <tr>
                <td colSpan={6} className="skeleton"></td>
              </tr>
              <tr>
                <td colSpan={6} className="skeleton"></td>
              </tr>
            </>
          ) : isError ? (
            <tr>
              <td colSpan={6}>Error: {error.message}</td>
            </tr>
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
                    : transaction.status ==202
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
