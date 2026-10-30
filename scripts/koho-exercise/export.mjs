/*
  moves.ts の動きを JSON に書き出す。動画の作り直し方（Mac のみ）：
    node scripts/koho-exercise/export.mjs <作業用フォルダ>/moves.json
    swiftc -O -o <作業用フォルダ>/render scripts/koho-exercise/render.swift
    <作業用フォルダ>/render <作業用フォルダ>/moves.json video public/videos/koho
  カード用の絵は、render の thumb で作る（render.swift の先頭を参照）
*/
import { writeFileSync } from 'node:fs';
import { allMoves } from './moves.ts';

writeFileSync(process.argv[2], JSON.stringify(allMoves()));
