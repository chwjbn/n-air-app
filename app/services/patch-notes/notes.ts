import { IPatchNotes } from '.';

export const notes: IPatchNotes = {
  version: '1.0.20200909-unstable.1',
  title: '1.0.20200909-unstable.1',
  notes: [
    '修正: ニコ生エリアのエラーダイアログを英訳 (#445)',
    '修正: 不要になった30日アンケート画面の処理を削除 (#447)',
    '修正: 不要になったNG共有フィルター設定を削除 (#462)',
    '修正: 同種ソースが存在しない場合の文言を和訳 (#463)',
    '修正: 配信最適化時に出力が詳細になっているとハードウェアエンコーダーが選択されなかった(エンコー',
    'ダー名称もおかしかった) (#460)',
    '開発: crash report送信先をbacktraceからsentryに変更 (#449)',
  ],
};
