import { useState } from "react";
import "./App.css";
import { CSVLink } from "react-csv";

function App() {
  const [characters, setCharacters] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [backspaceStack, setBackspaceStack] = useState([]);
  const [name, setName] = useState("");
  const [totalResult, setTotalResult] = useState([]);
  const givenText = "the quick brown fox jumps";
  const [i, setI] = useState(0);

  const handleName = (event) => {
    setName((prevName) => {
      return prevName + event.key;
    });
  };

  const handleKey = (event) => {
    if (!startTime) {
      setStartTime(new Date());
    }
    if (event.key === "Backspace") {
      setBackspaceStack((prevStack) => [...prevStack, event.key]);
    } else if (backspaceStack.length === 0) {
      const character = {
        name: event.key,
        time: new Date() - startTime,
      };
      setCharacters((prevChars) => [...prevChars, character]);
    } else {
      setBackspaceStack((prevStack) => prevStack.slice(0, -1));
    }
  };

  const handleDone = () => {
    const numChars = givenText.length;
    const numSegments = 5;
    const segmentLength = Math.ceil(numChars / numSegments);
    const givenChars = givenText.split("");
    const result = {
      accuracy: 0,
      speed: 0,
    };

    const givenCharCounts = {};
    const correctCharCounts = {};
    for (let char of "abcdefghijklmnopqrstuvwxyz") {
      givenCharCounts[char] = 0;
      correctCharCounts[char] = 0;
    }

    for (let char of givenChars) {
      givenCharCounts[char]++;
    }

    let totalCorrectChars = 0;
    let totalTime = 0;
    for (let i = 0; i < numSegments; i++) {
      const segmentStart = i * segmentLength;
      const segmentEnd = Math.min(segmentStart + segmentLength, numChars);
      const segmentTypedChars = characters.slice(segmentStart, segmentEnd);
      const segmentTypedText = segmentTypedChars
        .map((char) => char.name)
        .join("");
      const segmentCorrectChars = segmentTypedChars.filter((char, j) => {
        const typedChar = char.name;
        const isCorrect = typedChar === givenChars[segmentStart + j];
        if (isCorrect) correctCharCounts[typedChar]++;
        return isCorrect;
      });
      const segmentAccuracy = Math.round(
        (segmentCorrectChars.length / segmentLength) * 100
      );
      const segmentWords = segmentTypedText.split(" ");
      const segmentTotalTime = segmentTypedChars.length
        ? segmentTypedChars[segmentTypedChars.length - 1].time -
          (segmentStart > 0 ? characters[segmentStart - 1].time : 0)
        : 0;
      const segmentWpm = Math.round(
        (segmentWords.length / segmentTotalTime) * 60000
      );

      totalCorrectChars += segmentCorrectChars.length;
      totalTime += segmentTotalTime;

      result[`segment_${i + 1}_accuracy`] = segmentAccuracy;
      result[`segment_${i + 1}_speed`] = segmentWpm;
    }

    for (let char of "abcdefghijklmnopqrstuvwxyz") {
      result[`${char}_accuracy`] =
        givenCharCounts[char] > 0
          ? correctCharCounts[char] / givenCharCounts[char]
          : -1;
    }

    result.accuracy = Math.round((totalCorrectChars / numChars) * 100);
    result.speed = Math.round((numChars / 5 / totalTime) * 60000);
    result["name"] = name;
    console.log(result);
    setTotalResult((prev) => {
      prev[i] = result;
      return prev;
    });
    setI((prev) => prev + 1);
    setCharacters([]);
    document.getElementById("keyId").value = "";
    console.log("total result :");
    console.log(totalResult);
  };

  return (
    <div>
      Type the following paragraph
      <div>{givenText}</div>
      <input id="nameId" type="text" className="input" onKeyDown={handleName} />
      <input id="keyId" type="text" className="input" onKeyDown={handleKey} />
      <div onClick={handleDone}>Done</div>
      <CSVLink data={totalResult}>Download me</CSVLink>;
    </div>
  );
}

export default App;
