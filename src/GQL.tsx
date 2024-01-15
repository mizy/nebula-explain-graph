import { Popover } from "antd";
import { Fragment, useMemo } from "react";

import {
  NgqlFuncTools,
  NgqlSingleOperator,
  NgqlWordsUppercase,
} from "./gqlHitWords";

import styles from "./GQL.module.less";

interface Props {
  ngql: string;
}

const MaxLength = 100;
const Blank = () => <span> </span>;

function NgqlRender(props: Props) {
  const { ngql } = props;

  const showedNgql = useMemo(
    () => (ngql.length > MaxLength ? `${ngql.slice(0, 100)}...` : ngql),
    [ngql]
  );

  const popover = useMemo(() => ngql.length > MaxLength, [ngql]);

  const contentRender = (str: string) => {
    const ngqls = str.split(";");
    const res: any[] = [];
    ngqls.forEach((item, index) => {
      const ngqlArr = item.split(" ");
      if (index !== 0) {
        res.push(
          <Fragment key={"line"+index}>
            <span>;</span>
            <br key={"br" + index} />
          </Fragment>
        );
      }
      res.push(
        ...ngqlArr.map((item, index2) => {
          const i = `${index}-${index2}`;
          if (NgqlWordsUppercase.includes(item.toUpperCase())) {
            return (
              <span key={i} className={styles.ngqlKeyWord}>
                {item}
                <Blank />
              </span>
            );
          }
          if (NgqlSingleOperator.includes(item)) {
            return (
              <span key={i} className={styles.ngqlSingleOperator}>
                {item}
                <Blank />
              </span>
            );
          }
          const operate = NgqlFuncTools.find((func) => item.indexOf(func) > -1);
          if (operate) {
            const index = item.indexOf(operate);
            return (
              <span key={i} className={styles.ngqlNormal}>
                {item.slice(0, index)}
                <span className={styles.ngqlFuncName}>
                  {item.slice(index + operate.length)}
                </span>
                {item.slice(index + operate.length)}
                <Blank />
              </span>
            );
          }
          return (
            <span key={i} className={styles.ngqlNormal}>
              {item}
              <Blank />
            </span>
          );
        })
      );
    });
    return res;
  };

  if (popover) {
    return (
      <Popover
        content={
          <div className={styles.ngqlPopover}>{contentRender(ngql)}</div>
        }
      >
        <span className={styles.ngql}>{contentRender(showedNgql)}</span>
      </Popover>
    );
  }
  return <span className={styles.ngql}>{contentRender(showedNgql)}</span>;
}

export default NgqlRender;
