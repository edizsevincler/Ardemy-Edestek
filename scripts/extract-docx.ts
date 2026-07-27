import mammoth from "mammoth";
import * as fs from "fs";

async function main() {
  const filePath = "C:\\Users\\Kemal_Tahir\\Downloads\\English curriculum 23.09.2021 Güncel (1).docx";
  const result = await mammoth.extractRawText({ path: filePath });
  fs.writeFileSync(
    "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad_english_curriculum.txt",
    result.value,
    "utf-8"
  );
  console.log("Toplam karakter:", result.value.length);
  console.log("Messages:", result.messages.length);
}

main();
