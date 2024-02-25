"use client";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="footer p-10 bg-neutral text-white">
      <aside>
        <Image
          src={"/images/logo.png"}
          alt={""}
          className="w-36 h-36"
          height={400}
          width={400}
        ></Image>
        <h2 className="text-xl font-bold font-sans">Ez Miner Dot Tech</h2>
        <span> Real CPU Minning. No to cloud minning !</span>
      </aside>

      <nav>
        <h6 className="footer-title">Social and Community</h6>
        <a href="https://t.me/od_network" className="link link-hover">
          Telegram
        </a>
        <a href="https://twitter.com/westnileod" className="link link-hover">
          Twitter
        </a>
        <a href="https://instagram.com/westnileod" className="link link-hover">
          Instagram
        </a>
        <a href="https://reddit.com/r/odcrypto" className="link link-hover">
          Reddit
        </a>
      </nav>
      <nav>
        <h6 className="footer-title">Contact Us or Support</h6>
        <a href="https://discord.gg/SqURugTQdM" className="link link-hover">
          Discord
        </a>
      </nav>

      <nav>
        <h6 className="footer-title">Legal</h6>
        <a href="#" className="link link-hover">
          As you use our service we have the rights to do what ever we want !
        </a>
      </nav>
    </footer>
  );
}
