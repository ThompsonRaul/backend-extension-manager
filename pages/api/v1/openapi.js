import { getApiDocsV1 } from "lib/swagger/getApiDocsV1";

export default function handler(req, res) {
  const spec = getApiDocsV1();
  res.status(200).json(spec);
}
