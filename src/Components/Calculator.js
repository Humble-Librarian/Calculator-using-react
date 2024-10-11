import React, { useReducer, useCallback, useMemo } from 'react';
import styles from './Calculator.module.css';

const initialState = {
  display: '0',
  expression: '',
};

const degToRad = (degrees) => degrees * (Math.PI / 180);

function reducer(state, action) {
  switch (action.type) {
    case 'APPEND':
      return {
        ...state,
        expression: state.expression + action.payload,
        display: state.expression + action.payload,
      };
    case 'CLEAR':
      return initialState;
    case 'DELETE':
      return {
        ...state,
        expression: state.expression.slice(0, -1),
        display: state.expression.slice(0, -1) || '0',
      };
    case 'EVALUATE':
      try {
        
        const sanitizedExpression = state.expression
          .replace(/Math\.sin\(/g, 'Math.sin(degToRad(')
          .replace(/Math\.cos\(/g, 'Math.cos(degToRad(')
          .replace(/Math\.tan\(/g, 'Math.tan(degToRad(')
          .replace(/Math\.log10/g, 'Math.log10')
          .replace(/Math\.sqrt/g, 'Math.sqrt')
          .replace(/Factorial/g, 'Factorial')
          .replace(/\^/g, '**');  

        
        const balancedExpression = sanitizedExpression.replace(/Math\.(sin|cos|tan)\(degToRad\((.*?)\)/g, 'Math.$1(degToRad($2))');

        // eslint-disable-next-line no-new-func
        const result = new Function('Factorial', 'degToRad', `return ${balancedExpression}`)(Factorial, degToRad);
        return {
          display: result.toString(),
          expression: result.toString(),
        };
      } catch (error) {
        return {
          display: 'Error',
          expression: '',
        };
      }
    default:
      return state;
  }
}

const Factorial = (function() {
  const cache = {};
  return function factorial(n) {
    if (n in cache) return cache[n];
    n = parseInt(n);
    if (isNaN(n)) return NaN;
    if (n <= 1) return 1;
    const result = n * factorial(n - 1);
    cache[n] = result;
    return result;
  };
})();

const Calculator = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleButtonClick = useCallback((value) => {
    if (value === '=') {
      dispatch({ type: 'EVALUATE' });
    } else if (value === 'DEL') {
      dispatch({ type: 'DELETE' });
    } else if (value === 'C') {
      dispatch({ type: 'CLEAR' });
    } else {
      dispatch({ type: 'APPEND', payload: value });
    }
  }, []);

  const handleFunctionClick = useCallback((func) => {
    let payload;
    switch (func) {
      case 'sin':
      case 'cos':
      case 'tan':
        payload = `Math.${func}(`; 
        break;
      case 'log':
        payload = 'Math.log10(';
        break;
      case 'sqrt':
        payload = 'Math.sqrt(';
        break;
      case 'factorial':
        payload = 'Factorial(';
        break;
      default:
        payload = '';
    }
    dispatch({ type: 'APPEND', payload });
  }, []);

  const renderButton = useCallback((value, onClickFunction) => (
    <button key={value} onClick={() => onClickFunction(value)} className={styles.button}>
      {value}
    </button>
  ), []);

  const functionButtons = useMemo(() => (
    ['sin', 'cos', 'tan', 'log', 'sqrt', 'factorial'].map(func => 
      renderButton(func, handleFunctionClick)
    )
  ), [renderButton, handleFunctionClick]);

  const numberButtons = useMemo(() => (
    ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0', '.'].map(value => 
      renderButton(value, handleButtonClick)
    )
  ), [renderButton, handleButtonClick]);

  const operatorButtons = useMemo(() => (
    ['+', '-', '*', '/', '^', '(', ')'].map(value => 
      renderButton(value, handleButtonClick)
    )
  ), [renderButton, handleButtonClick]);

  const actionButtons = useMemo(() => (
    ['DEL', 'C', '='].map(value => 
      renderButton(value, handleButtonClick)
    )
  ), [renderButton, handleButtonClick]);

  return (
    <div className={styles.calculator}>
      <div className={styles.display}>{state.display}</div>
      <div className={styles.buttonContainer}>
        {numberButtons}
        {operatorButtons}
        {functionButtons}
        {actionButtons}
      </div>
    </div>
  );
};

export default React.memo(Calculator);