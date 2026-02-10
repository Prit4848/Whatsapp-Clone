import { Loader2 } from "lucide-react";

const AppLoader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-[#25d466]" />
      <p className="mt-3 text-sm text-slate-200">{text}</p>
    </div>
  );
};

export default AppLoader;
