import logo from './logo.svg';
import './App.css';
import CodeConverter from './CodeConverter';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ARM/CloudFormation to Terraform Converter</h1>
      </header>
      <CodeConverter />
    </div>  );
}

export default App;
