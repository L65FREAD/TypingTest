import { useState } from "react";
import "./App.css";
import { CSVLink } from "react-csv";

function App() {
  const [characters, setCharacters] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [backspaceStack, setBackspaceStack] = useState([]);
  const [name, setName] = useState("");
  const [totalResult, setTotalResult] = useState([]);
  const givenText =
    "the quick brown fox jumps over the lazy dog showcasing the use of all letters of the english alphabet this pangram has been widely used as a tool to test the readability and legibility of fonts as well as to showcase the ability to type all the letters of the alphabet in a single sentence";
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

  const initializeCharCounts = () => {
    const charCounts = {};
    for (let char of "abcdefghijklmnopqrstuvwxyz") {
      charCounts[char] = 0;
    }
    return charCounts;
  };

  const countGivenChars = (givenChars, givenCharCounts) => {
    for (let char of givenChars) {
      givenCharCounts[char]++;
    }
  };

  const calculateSegmentResult = (
    index,
    segmentLength,
    givenChars,
    correctCharCounts
  ) => {
    const segmentStart = index * segmentLength;
    const segmentEnd = Math.min(
      segmentStart + segmentLength,
      givenChars.length
    );
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

    return {
      correctChars: segmentCorrectChars.length,
      totalTime: segmentTotalTime,
      accuracy: segmentAccuracy,
      speed: segmentWpm,
    };
  };

  const calculateIndividualCharAccuracy = (
    result,
    correctCharCounts,
    givenCharCounts
  ) => {
    for (let char of "abcdefghijklmnopqrstuvwxyz") {
      result[`${char}_accuracy`] =
        givenCharCounts[char] > 0
          ? correctCharCounts[char] / givenCharCounts[char]
          : -1;
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

    const givenCharCounts = initializeCharCounts();
    const correctCharCounts = initializeCharCounts();
    countGivenChars(givenChars, givenCharCounts);

    let totalCorrectChars = 0;
    let totalTime = 0;
    for (let i = 0; i < numSegments; i++) {
      const segmentResult = calculateSegmentResult(
        i,
        segmentLength,
        givenChars,
        correctCharCounts
      );

      totalCorrectChars += segmentResult.correctChars;
      totalTime += segmentResult.totalTime;

      result[`segment_${i + 1}_accuracy`] = segmentResult.accuracy;
      result[`segment_${i + 1}_speed`] = segmentResult.speed;
    }

    calculateIndividualCharAccuracy(result, correctCharCounts, givenCharCounts);

    result.accuracy = Math.round((totalCorrectChars / numChars) * 100);
    result.speed = Math.round((numChars / 5 / totalTime) * 60000);
    result["name"] = name;

    setTotalResult((prev) => {
      prev[i] = result;
      return prev;
    });
    setI((prev) => prev + 1);
    setCharacters([]);
    document.getElementById("keyId").value = "";
    setStartTime(null);
  };

  return (
    <div>
      Type the following paragraph
      <br />
      <br />
      <div>{givenText}</div>
      <br />
      <input
        id="nameId"
        type="text"
        className="input"
        onKeyDown={handleName}
        placeholder="name"
      />
      <br />
      <input
        id="keyId"
        type="text"
        className="input"
        onKeyDown={handleKey}
        placeholder="text"
      />
      <br />
      <div onClick={handleDone}>Done</div>
      <br />
      <CSVLink data={totalResult}>Download me</CSVLink>;
    </div>
  );
}

export default App;
