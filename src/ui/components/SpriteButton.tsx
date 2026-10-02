import type { ComponentProps } from "react";
import { sound } from "../../audio/sound";

interface SpriteButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary";
}

export function SpriteButton({
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  ...rest
}: SpriteButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      onClick={(event) => {
        sound.play("click");
        onClick?.(event);
      }}
      {...rest}
    />
  );
}