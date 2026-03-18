'use client';

import { useState, useCallback } from 'react';
import styles from './calculator.module.css';

type ButtonValue = string;

const buttons: ButtonValue[][] = [
  ['C', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export default function Calculator() {
  const [display, setDisplay] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>('');

  const calculate = useCallback(
    (a: number, b: number, op: string): number => {
      switch (op) {
        case '+':
          return a + b;
        case '-':
          return a - b;
        case '×':
          return a * b;
        case '÷':
          return b !== 0 ? a / b : NaN;
        default:
          return b;
      }
    },
    []
  );

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return 'Error';
    const str = num.toString();
    if (str.length > 12) {
      return parseFloat(num.toPrecision(10)).toString();
    }
    return str;
  };

  const handleButton = useCallback(
    (value: ButtonValue) => {
      if (value === 'C') {
        setDisplay('0');
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        setExpression('');
        return;
      }

      if (value === '+/-') {
        const num = parseFloat(display);
        setDisplay(formatNumber(-num));
        return;
      }

      if (value === '%') {
        const num = parseFloat(display);
        setDisplay(formatNumber(num / 100));
        return;
      }

      if (['+', '-', '×', '÷'].includes(value)) {
        if (previousValue !== null && operator && !waitingForOperand) {
          const result = calculate(
            parseFloat(previousValue),
            parseFloat(display),
            operator
          );
          const formatted = formatNumber(result);
          setDisplay(formatted);
          setPreviousValue(formatted);
          setExpression(formatted + ' ' + value);
        } else {
          setPreviousValue(display);
          setExpression(display + ' ' + value);
        }
        setOperator(value);
        setWaitingForOperand(true);
        return;
      }

      if (value === '=') {
        if (previousValue !== null && operator) {
          const result = calculate(
            parseFloat(previousValue),
            parseFloat(display),
            operator
          );
          const formatted = formatNumber(result);
          setExpression(previousValue + ' ' + operator + ' ' + display + ' =');
          setDisplay(formatted);
          setPreviousValue(null);
          setOperator(null);
          setWaitingForOperand(true);
        }
        return;
      }

      if (value === '.') {
        if (waitingForOperand) {
          setDisplay('0.');
          setWaitingForOperand(false);
          return;
        }
        if (!display.includes('.')) {
          setDisplay(display + '.');
        }
        return;
      }

      // Digit
      if (waitingForOperand) {
        setDisplay(value);
        setWaitingForOperand(false);
      } else {
        setDisplay(display === '0' ? value : display + value);
      }
    },
    [display, previousValue, operator, waitingForOperand, calculate]
  );

  const getButtonClass = (value: ButtonValue): string => {
    if (['÷', '×', '-', '+'].includes(value)) return styles.operatorBtn;
    if (value === '=') return styles.equalsBtn;
    if (['C', '+/-', '%'].includes(value)) return styles.functionBtn;
    return styles.numberBtn;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.calculator}>
        <div className={styles.display}>
          <div className={styles.expression}>{expression || '\u00A0'}</div>
          <div className={styles.current}>{display}</div>
        </div>
        <div className={styles.buttons}>
          {buttons.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((btn) => (
                <button
                  key={btn}
                  className={`${styles.btn} ${getButtonClass(btn)} ${
                    btn === '0' ? styles.zeroBtn : ''
                  }`}
                  onClick={() => handleButton(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
