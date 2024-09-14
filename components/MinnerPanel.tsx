"use client";

import Script from "next/script";
import * as jwt from "jsonwebtoken";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { array } from "yup";
declare global {
  var minners: undefined | any;
}

export default function MinnerPanel() {
  const [throttle, setThrottle] = useState(0);
  const [threads, setThreads] = useState(4);
  const [hashes, setHashes] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const router = useRouter();
  const [stats, setStats] = useState<string[]>([
    "Welcome to Minner Panel",
    "Please start minning to get started",
  ]);
  const createMinner = async () => {
    const windows: any = window || undefined;
    const token = windows.localStorage.getItem("user");

    if (token == null) {
      router.push("/login");
      toast.error("Please login to start minning");
      return false;
    }

    const info = JSON.parse(token);
    globalThis.minners = new windows.Client.User(info.site_key, `${info.id}`, {
      throttle: throttle,
      threads: threads,
      c: "w",
    });
    return true;
  };
  const startMinner = async () => {
    if (!(await createMinner())) {
      return false;
    }
    globalThis.minners.start();
    globalThis.minners.on("open", function (open: any) {
      setStats((arrayData) => ["Miner Started", ...arrayData]);
    });
    globalThis.minners.on("job", function (job: any) {
      setStats((arrayData) => ["New Job Recieved", ...arrayData]);
    });
    globalThis.minners.on("found", function (found: any) {
      setStats((arrayData) => ["Block Found", ...arrayData]);
    });
    globalThis.minners.on("close", function (found: any) {
      setStats((arrayData) => ["Miner Stopped", ...arrayData]);
    });
    toast.success("Miner Started");
    setInterval(function () {
      setStats([]);
      setStats((arrayData) => ["Logs cleared", ...arrayData]);
    }, 60000);
    setInterval(function () {
      setHashes(globalThis.minners.getHashesPerSecond());
    }, 1500);
    setInterval(function () {
      setTotalHashes(globalThis.minners.getTotalHashes());
    }, 30000);
  };

  console.log(stats.length);
  return (
    <>
      <Script
        src="https://www.hostingcloud.racing/XAVx.js"
        onLoad={() => {
          const windows: any = window || undefined;
          if (typeof windows === "undefined") return;
        }}
      ></Script>
      <div className="card w-1/2 bg-neutral text-neutral-content">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Minner Panel</h2>
          <div className="stats bg-primary text-primary-content">
            <div className="stat">
              <div className="stat-title">Hash/S</div>
              <div className="stat-value">{`${hashes.toFixed(2)} H/S`}</div>
              <div className="stat-desc">Hashes updates every 1.5 seconds</div>
            </div>

            <div className="stat">
              <div className="stat-title">Total Hashes Minned</div>
              <div className="stat-value">{`${totalHashes.toFixed(
                2
              )} Hashes`}</div>
              <div className="stat-desc">Hashes updates every 30 seconds</div>
            </div>
          </div>
          <div className="stats bg-primary text-primary-content">
            <div className="stat">
              <div className="stat-title">CPU Throttle</div>
              <div className="stat-value">
                <div className="join">
                  <button
                    onClick={() => {
                      console.log(globalThis.minners);
                      const newThrottle = throttle - 0.01;
                      if (throttle > 0.01) {
                        setThrottle(newThrottle);
                        globalThis.minners.setThrottle(newThrottle);
                      }
                    }}
                    className={`join-item btn ${
                      globalThis.minners == undefined ? "btn-disabled" : ""
                    }`}
                  >
                    «
                  </button>
                  <button className="join-item btn">{`${Number(
                    throttle * 100
                  ).toFixed(0)} %`}</button>
                  <button
                    onClick={() => {
                      const newThrottle = throttle + 0.01;
                      if (throttle < 1) {
                        setThrottle(newThrottle);
                        globalThis.minners.setThrottle(newThrottle);
                      }
                    }}
                    className={`join-item btn ${
                      globalThis.minners == undefined ? "btn-disabled" : ""
                    }`}
                  >
                    »
                  </button>
                </div>
                <div className="stat-desc text-orange-500">
                  Higher percentage means Lower cpu power
                </div>
              </div>
            </div>

            <div className="stat">
              <div className="stat-title">Threads</div>
              <div className="stat-value">
                <div className="join">
                  <button
                    onClick={() => {
                      const newThreads = threads - 1;
                      if (threads > 0) {
                        setThreads(newThreads);
                        globalThis.minners.setNumThreads(newThreads);
                      }
                    }}
                    className={`join-item btn ${
                      globalThis.minners == undefined ? "btn-disabled" : ""
                    }`}
                  >
                    «
                  </button>
                  <button className="join-item btn">{threads}</button>
                  <button
                    onClick={() => {
                      const newThreads = threads + 1;
                      if (threads < 24) {
                        setThreads(newThreads);
                        globalThis.minners.setNumThreads(newThreads);
                      }
                    }}
                    className={`join-item btn ${
                      globalThis.minners == undefined ? "btn-disabled" : ""
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card-actions justify-end">
            <button
              onClick={() => {
                startMinner();
              }}
              className="btn btn-success"
            >
              Start
            </button>
            <button
              onClick={() => {
                if (globalThis.minners.isRunning()) {
                  globalThis.minners.stop();
                  toast.success("Minner Stopped");
                }
              }}
              className="btn btn-error"
            >
              Stop
            </button>
          </div>
          <div className="mockup-code bg-white text-xs text-left w-11/12 text-black overflow-y-auto">
            {stats.map((stat, index) => {
              return (
                <pre
                  key={index}
                  data-prefix={`~`}
                  className={`${index == 0 ? "border" : ""}`}
                >
                  <code>{stat}</code>
                </pre>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
