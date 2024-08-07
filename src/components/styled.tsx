import styled from "styled-components";
import { Color } from "../constants";

const Area = styled.div`
  display: flex;
  position: relative;
  margin: 0px;
  padding: 0px;
  border: 0.5px solid ${Color.DeepSeaBlue};
`;

const Content = styled.canvas`
  position: absolute;
  margin: 0px;
  padding: 0px;
  top: 0;
  left: 0;
  opacity: 0.9;
`;

export { Area, Content };
