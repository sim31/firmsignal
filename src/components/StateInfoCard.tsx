import { Button } from "@mui/material";
import { CardActions } from "@mui/material";
import React from "react";
import InfoCard, { InfoCardProps } from "./InfoCard";


export type StateInfoCardProps = InfoCardProps & React.PropsWithChildren;

export default function StateInfoCard(props: StateInfoCardProps) {
  const {children, ...otherProps} = props;

  return (
    <InfoCard {...otherProps}>
      {children}

      <CardActions>
        <Button>Propose modifications</Button>
      </CardActions>
    </InfoCard>
  )
}