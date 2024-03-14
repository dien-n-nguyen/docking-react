
import './App.css';
import MyViewerComponent from './components/Viewer/Viewer';
// import PSEViewer from './components/PlipViewer/PlipViewer';

function App() {
  return (
    <div>
    <div className="split left">
      <div className="centered">
        <MyViewerComponent />
      </div>
    </div>

    <div className="split right">
      <div className="centered">
         {/* <PSEViewer /> */}
      </div>
    </div>
    </div>
  );
}

export default App;
