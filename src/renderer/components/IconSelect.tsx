import { useEffect, useId, useMemo, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
  icon?: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function IconSelect({ options, value, onChange, placeholder = "Выберите" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const id = useId();

  const selected = useMemo(() => options.find((item) => item.value === value), [options, value]);
  const selectedIndex = useMemo(() => Math.max(0, options.findIndex((item) => item.value === value)), [options, value]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!ref.current) return;
      if (event.target instanceof Node && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const current = listRef.current?.querySelector<HTMLButtonElement>(`[data-index='${selectedIndex}']`);
    current?.focus();
  }, [open, selectedIndex]);

  useEffect(() => {
    setOpen(false);
  }, [value]);

  const moveFocus = (nextIndex: number) => {
    const bounded = Math.max(0, Math.min(options.length - 1, nextIndex));
    listRef.current?.querySelector<HTMLButtonElement>(`[data-index='${bounded}']`)?.focus();
  };

  return (
    <div className="icon-select" ref={ref}>
      <button
        type="button"
        className="icon-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
          }
        }}
      >
        <span>{selected ? `${selected.icon ?? ""} ${selected.label}`.trim() : placeholder}</span>
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="icon-select-list" id={`${id}-listbox`} role="listbox" ref={listRef} tabIndex={-1}>
          {options.map((item, index) => (
            <button
              key={`${item.value}-${index}`}
              type="button"
              role="option"
              aria-selected={item.value === value}
              data-index={index}
              className={`icon-select-item ${item.value === value ? "active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  moveFocus(index + 1);
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  moveFocus(index - 1);
                }
                if (e.key === "Home") {
                  e.preventDefault();
                  moveFocus(0);
                }
                if (e.key === "End") {
                  e.preventDefault();
                  moveFocus(options.length - 1);
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(item.value);
                  setOpen(false);
                }
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
