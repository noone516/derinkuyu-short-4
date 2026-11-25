import React from "react";
import { Composition, registerRoot } from "remotion";
import { DerinkuyuShort } from "./videos/derinkuyu/DerinkuyuShort";

registerRoot(() => (
  <React.Fragment>
    <Composition
      id="DerinkuyuShort"
      component={DerinkuyuShort}
      durationInFrames={1860}
      fps={30}
      width={1440}
      height={2560}
      defaultProps={{}}
    />
  </React.Fragment>
));