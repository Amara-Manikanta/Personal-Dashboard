
console.log("StateDetailsFixed loading...");
window.StateDetails = ({ stateName, onBack }) => {
    return (
        <div style={{ padding: '20px', color: 'white' }}>
            <button onClick={onBack} style={{ marginBottom: '20px', padding: '10px' }}>Back</button>
            <h1>Details for {stateName}</h1>
            <p>This is a fixed minimal component.</p>
        </div>
    );
};
console.log("StateDetailsFixed loaded. window.StateDetails assigned.");
