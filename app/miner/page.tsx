import MinnerPanel from "@/components/MinnerPanel";

export default function Home() {
  return (
    <div id="home" className="hero min-h-screen  bg-base-100">
      <div className="hero-content w-screen flex flex-row">
        <iframe
          data-aa="2128000"
          src="//ad.a-ads.com/2128000?size=250x250"
          style={{
            width: "250px",
            height: "250px",
            border: "0px",
            padding: "0",
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
        ></iframe>
        <MinnerPanel />
      </div>
    </div>
  );
}
