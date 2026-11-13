/*
  moves.ts の動きを JSON に書き出す。動画の作り直し方（Mac のみ）：
    node scripts/kettlebell-swing/export.mjs <作業用フォルダ>/moves.json
    swiftc -O -o <作業用フォルダ>/render scripts/kettlebell-swing/render.swift
    <作業用フォルダ>/render <作業用フォルダ>/moves.json video public/videos/kettlebell
  確認用の一覧は render の sheet で作る（render.swift の先頭を参照）
*/
import { writeFileSync } from 'node:fs';
import { allMoves } from './moves.ts';

writeFileSync(process.argv[2], JSON.stringify(allMoves()));
