import { useParams } from "react-router-dom";
import { MyCanvasLoader } from "./MyCanvasLoader";

export const ViewPage = () => {
  const address = useParams().address!;
  return <MyCanvasLoader writeable={true} address={address} />;
};
