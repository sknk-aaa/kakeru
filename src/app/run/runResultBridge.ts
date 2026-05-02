// Background DB 書き込みと結果ページの間で runId を橋渡しするシンプルなブリッジ。
// navigate 後に書き込みが完了したタイミングで結果ページへ通知する。

type Callback = (runId: string) => void;

let pendingCallback: Callback | null = null;
let pendingRunId: string | null = null;

export function awaitRunId(callback: Callback) {
  if (pendingRunId !== null) {
    callback(pendingRunId);
    pendingRunId = null;
  } else {
    pendingCallback = callback;
  }
}

export function resolveRunId(runId: string) {
  if (pendingCallback !== null) {
    pendingCallback(runId);
    pendingCallback = null;
  } else {
    pendingRunId = runId;
  }
}

export function clearRunIdBridge() {
  pendingCallback = null;
  pendingRunId = null;
}
