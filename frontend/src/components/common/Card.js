import React from "react";
import clsx from "clsx";

const Card = ({ children, className, hover = false, padding = true }) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-sm border border-slate-100",
        padding && "p-6",
        hover && "card-hover cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
