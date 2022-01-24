import React from "react";
import cn from "classnames";

const MenuItem = ({ isSelected, onClick, label }) => {
  return (
    <div
      className={cn("MenuItem", "unselectable", { selected: isSelected })}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default MenuItem;
