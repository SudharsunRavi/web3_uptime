const UptimeTicks=({ ticks })=>{
  return (
    <div className="flex gap-1 mt-2">
      {ticks && ticks.map((tick, index) => (
        <div key={index} className={`w-8 h-2 rounded ${
          tick === 'good' ? 'bg-green-500' :
          tick === 'bad' ? 'bg-red-500' :
          'bg-gray-500'
        }`} />
      ))}
    </div>
  );
}

export default UptimeTicks;