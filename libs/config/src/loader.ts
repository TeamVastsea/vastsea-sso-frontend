import { readFileSync } from 'fs';
import { parse as parseToml } from 'toml';
import { Configure } from './config.option';

export const tomlLoader = (path: string) => {
  return () => {
    const content = readFileSync(path).toString();

    return parseToml(content) as Configure;
  };
};
