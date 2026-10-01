import AlgsPage from "../page";

// Catch-all sibling of /algs — handles every nested Algs URL:
//   /algs/2x2
//   /algs/2x2/cll
//   /algs/2x2/cll/<algId>
// AlgsPage reads the segments via useParams(), keeping it the single source
// of truth for cube / category / the open detail modal.
export default function AlgNestedPage() {
  return <AlgsPage />;
}