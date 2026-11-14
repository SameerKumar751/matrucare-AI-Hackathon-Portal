/** Small monospaced section identifier, e.g. [ 02 / DOMAINS ] */
export default function SectionLabel({ n, children }) {
  return <p className="mono-label">[ {n} / {children} ]</p>;
}
