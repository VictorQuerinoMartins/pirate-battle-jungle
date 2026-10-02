import type { ComponentProps } from "react";

interface SpriteButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary";
}

// A real <button> (keyboard, focus and accessible name) drawn with the sprites
// of the UI pack. The look comes from the classes in ui.css.
export function SpriteButton({
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: SpriteButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      {...rest}
    />
  );
}