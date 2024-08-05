"use client";

import Script from "next/script";
import * as jwt from "jsonwebtoken";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
declare global {
  var minners: undefined | any;
}

export default function MinnerPanel() {
  const [throttle, setThrottle] = useState(0);
  const [threads, setThreads] = useState(4);
  const [hashes, setHashes] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const router = useRouter();
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
    console.log(globalThis.minners);
    return true;
  };
  const startMinner = async () => {
    if (!(await createMinner())) {
      return false;
    }
    globalThis.minners.start();
    globalThis.minners.on("open", function (open: any) {
      console.log(open);
      toast.success("Started Connection to stratum server");
    });
    globalThis.minners.on("job", function (job: any) {
      console.log(job);
      toast.warning("Miner Started Job");
    });
    globalThis.minners.on("found", function (found: any) {
      console.log(found);
      toast.info("Miner Found Hashes");
    });
    globalThis.minners.on("close", function (found: any) {
      console.log(found);
      toast.info(
        "Connection to stratum server closed.Please restart the Miner."
      );
    });
    toast.success("Miner Started");
    setInterval(function () {
      setHashes(globalThis.minners.getHashesPerSecond());
    }, 1500);
    setInterval(function () {
      setTotalHashes(globalThis.minners.getTotalHashes());
    }, 30000);
  };

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
                        console.log(globalThis.minners.getThrottle());
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
                        console.log(globalThis.minners.getThrottle());
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
        </div>
      </div>
    </>
  );
}
