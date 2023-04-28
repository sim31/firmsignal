import { css } from "@mui/material";
import { SHORTENED_ADDR_WIDTH } from "../config";

export function customTextWidth(width = SHORTENED_ADDR_WIDTH) {
  return {
    width: '100%',
    maxWidth: width,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
}

export const customTextWidthCss = (width = SHORTENED_ADDR_WIDTH) =>  {
  return css(customTextWidth(width));
}

export const shortenedAddrCss = customTextWidthCss(SHORTENED_ADDR_WIDTH);

export const shortenedAddr = customTextWidth(SHORTENED_ADDR_WIDTH);

export function shortBlockId(id: string, len: number = 10) {
  return `${id.slice(0, len)}...`;
}

export function shortAddress(id: string, len: number = 10) {
  return `${id.slice(0, len)}...`;
}