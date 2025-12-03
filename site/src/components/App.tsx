//@ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Form, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { HighlightEnums } from "../Helpers/HighlightEnums";
import styles from "../styles/App.module.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const Word = ({ letter, milikit, highlight, key }) => (
  <span className={styles.inlineBlock}>
    <span className={styles.singleInput} name={key} data-key={key}>
      {milikit[key] || ""}
    </span>
    <span className={[styles.singleWord, highlight].join(" ")} data-key={key}>
      {letter}
    </span>
  </span>
);

const App = () => {
  const location = useLocation();
  const resolvedLocation = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchWeek = searchParams.get("week");
    const searchDay = searchParams.get("day");
    const searchHighlight = searchParams.get("highlight");

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const pathWeek = pathSegments[0];
    const pathDay = pathSegments[1];
    const pathHighlight = pathSegments[2];

    return {
      week: searchWeek || pathWeek || "meskerem",
      day: searchDay || pathDay || "1",
      highlight: searchHighlight || pathHighlight,
    };
  }, [location.pathname, location.search]);

  const [data, setData] = useState([]);
  const [milikit, setMilikit] = useState([]);
  const [week, setWeek] = useState(resolvedLocation.week);
  const [day, setDay] = useState(resolvedLocation.day);
  const highlight = resolvedLocation.highlight;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWeek(resolvedLocation.week);
    setDay(resolvedLocation.day);
  }, [resolvedLocation.day, resolvedLocation.week]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, signRes] = await Promise.all([
          import(`../data/${week}/${day}.json`),
          import(`../data/${week}/${day}.sign.json`),
        ]);
        setData(res.default);
        setMilikit(signRes.default);
        setError(null);
      } catch (fetchError) {
        console.error(fetchError);
        setError(`No data found for ${week}/${day}.`);
        setData([]);
        setMilikit([]);
      }

      if (highlight) {
        const element = document.getElementById(highlight);

        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    fetchData();
  }, [week, day, highlight]);

  const onClickHandler = (el) => {
    // Do something here to tell the player to play audio
  };

  const renderWord = (letter, milikit, highlight, key) => (
    <Word letter={letter} milikit={milikit} highlight={highlight} key={key} />
  );

  const renderContent = (item, index) => (
    <div
      key={index}
      onClick={onClickHandler}
      id={item.title}
      className={item.title === highlight ? "highlighted" : ""}
    >
      <h2 className={styles.title}>
        {item.title}{" "}
        <span className="house">{item.house || item.houseShort}</span>
      </h2>

    
      <p className={styles.paragraph}>
        {item.text &&
          item.text.split(" ").map((word, wordIndex) => {
            const wordKey = `arr-${index}_word-${wordIndex}`;
            const highlightClass =
              HighlightEnums.indexOf(word) > -1 ? "highlight" : "";

            return (
              <span key={wordKey} className={styles.dontBreak}>
                {word === "\n" ? <br /> : null}
                {word.split("").map((letter, letterIndex) => {
                  const letterKey = `arr-${index}_word-${wordIndex}_letter-${letterIndex}`;

                  return letter && letter !== " " ? (
                    renderWord(letter, milikit, highlightClass, letterKey)
                  ) : (
                    <span className={styles.inlineBlock} key={letterKey}>
                      <span
                        className={styles.singleWord}
                        data-key={letterKey}
                        key={letterKey}
                      >
                        &nbsp;
                      </span>
                    </span>
                  );
                })}
                <span> </span>
              </span>
            );
          })}
      </p>
    </div>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <Form method="POST" id="content">
        {error ? (
          <p className={styles.paragraph}>{error}</p>
        ) : (
          <div className="no-split-rows">{data.map(renderContent)}</div>
        )}
        <br />
        <br />
      </Form>
    </ThemeProvider>
  );
};

export default App;
