interface CodeIconProps {
  className?: string
  size?: number
}

export default function CodeIcon({ className = "", size = 24 }: CodeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 3 12 9 6"></polyline>
      <polyline points="15 6 21 12 15 18"></polyline>
    </svg>
  )
}

