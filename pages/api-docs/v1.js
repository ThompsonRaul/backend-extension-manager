import dynamic from "next/dynamic";
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsV1() {
  return <SwaggerUI url="/api/v1/openapi" persistAuthorization={false} />;
}
