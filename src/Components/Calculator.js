import React, { useReducer, useCallback, useMemo } from 'react'; // Import necessary React hooks
import styles from './Calculator.module.css'; // Import CSS module for styling

// Initial state for the calculator, including display and expression
const initialState = {
  display: '0',
  expression: '',
};

// Function to convert degrees to radians
const degToRad = (degrees) => degrees * (Math.PI / 180);

// Reducer function to manage the calculator's state
function reducer(state, action) {
  switch (action.type) {
    // Append a value to the current expression
    case 'APPEND':
      return {
        ...state,
        expression: state.expression + action.payload,
        display: state.expression + action.payload,
      };
    
    // Clear the calculator's state
    case 'CLEAR':
      return initialState;

    // Delete the last character from the expression
    case 'DELETE':
      return {
        ...state,
        expression: state.expression.slice(0, -1),
        display: state.expression.slice(0, -1) || '0',
      };

    // Evaluate the current expression
    case 'EVALUATE':
      try {
        // Sanitize the expression for evaluation
        const sanitizedExpression = state.expression
          .replace(/Math\.sin\(/g, 'Math.sin(degToRad(')
          .replace(/Math\.cos\(/g, 'Math.cos(degToRad(')
          .replace(/Math\.tan\(/g, 'Math.tan(degToRad(')
          .replace(/Math\.log10/g, 'Math.log10')
          .replace(/Math\.sqrt/g, 'Math.sqrt')
          .replace(/Factorial/g, 'Factorial')
          .replace(/\^/g, '**');  // Convert ^ to ** for power operations

        // Ensure the expression is balanced and correct
        const balancedExpression = sanitizedExpression.replace(/Math\.(sin|cos|tan)\(degToRad\((.*?)\)/g, 'Math.$1(degToRad($2))');

        // eslint-disable-next-line no-new-func
        // Create a new function for evaluating the expression
        const result = new Function('Factorial', 'degToRad', `return ${balancedExpression}`)(Factorial, degToRad);
        return {
          display: result.toString(), // Display the result
          expression: result.toString(), // Set the expression to the result
        };
      } catch (error) {
        // Handle any errors that occur during evaluation
        return {
          display: 'Error', // Display an error message
          expression: '',
        };
      }
      
    // Return the current state if action type is not recognized
    default:
      return state;
  }
}

// Factorial function with memoization for efficiency
const Factorial = (function() {
  const cache = {}; // Cache to store computed factorials
  return function factorial(n) {
    if (n in cache) return cache[n]; // Return cached value if available
    n = parseInt(n); // Parse n as an integer
    if (isNaN(n)) return NaN; // Return NaN if n is not a number
    if (n <= 1) return 1; // Base case for factorial
    const result = n * factorial(n - 1); // Recursive call
    cache[n] = result; // Cache the result
    return result;
  };
})();

// Main Calculator component
const Calculator = () => {
  // useReducer hook to manage calculator state
  const [state, dispatch] = useReducer(reducer, initialState);

  // Handle button clicks for numbers and operators
  const handleButtonClick = useCallback((value) => {
    if (value === '=') {
      dispatch({ type: 'EVALUATE' }); // Evaluate expression on '='
    } else if (value === 'DEL') {
      dispatch({ type: 'DELETE' }); // Delete last character on 'DEL'
    } else if (value === 'C') {
      dispatch({ type: 'CLEAR' }); // Clear the calculator on 'C'
    } else {
      dispatch({ type: 'APPEND', payload: value }); // Append value to expression
    }
  }, []);

  // Handle function button clicks (e.g., sin, cos)
  const handleFunctionClick = useCallback((func) => {
    let payload;
    // Define payload based on the function clicked
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
        payload = ''; // No action for unrecognized functions
    }
    dispatch({ type: 'APPEND', payload }); // Append function to expression
  }, []);

  // Render a button with provided value and click handler
  const renderButton = useCallback((value, onClickFunction) => (
    <button key={value} onClick={() => onClickFunction(value)} className={styles.button}>
      {value}
    </button>
  ), []);

  // Create arrays of function buttons using useMemo for performance
  const functionButtons = useMemo(() => (
    ['sin', 'cos', 'tan', 'log', 'sqrt', 'factorial'].map(func => 
      renderButton(func, handleFunctionClick)
    )
  ), [renderButton, handleFunctionClick]);

  // Create arrays of number buttons
  const numberButtons = useMemo(() => (
    ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0', '.'].map(value => 
      renderButton(value, handleButtonClick)
    )
  ), [renderButton, handleButtonClick]);

  // Create arrays of operator buttons
  const operatorButtons = useMemo(() => (
    ['+', '-', '*', '/', '^', '(', ')'].map(value => 
      renderButton(value, handleButtonClick)
    )
  ), [renderButton, handleButtonClick]);

  // Create action buttons (DEL, C, =)
  const actionButtons = useMemo(() => (
    ['DEL', 'C', '='].map(value => 
      renderButton(value, handleButtonClick)
    )
  ), [renderButton, handleButtonClick]);

  // Render the calculator interface
  return (
    <div className={styles.calculator}>
      <div className={styles.display}>{state.display}</div> {/* Display current value */}
      <div className={styles.buttonContainer}>
        {numberButtons} {/* Render number buttons */}
        {operatorButtons} {/* Render operator buttons */}
        {functionButtons} {/* Render function buttons */}
        {actionButtons} {/* Render action buttons */}
      </div>
    </div>
  );
};

// Export the Calculator component wrapped in React.memo for performance optimization
export default React.memo(Calculator);
