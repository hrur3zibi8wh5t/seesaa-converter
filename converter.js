const convertBtn = document.getElementById("convert");
const copyBtn = document.getElementById("copy");

const sourceArea = document.getElementById("source");
const resultArea = document.getElementById("result");

convertBtn.addEventListener("click", () => {
  const sourceTxt = sourceArea.value;
  resultArea.value = sourceTxt;

  convertBtn.innerHTML = "converted !!";
  setTimeout(() => (convertBtn.innerHTML = "convert"), 1000);
});

copyBtn.addEventListener("click", () => {
  const resultTxt = resultArea.value;
  navigator.clipboard.writeText(resultTxt).then(
    (success) => console.log("テキストのコピーに成功"),
    (error) => console.log("テキストのコピーに失敗")
  );

  copyBtn.innerHTML = "copied !!";
  setTimeout(() => (copyBtn.innerHTML = "copy"), 1000);
});
