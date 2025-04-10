const StatusCircle=({ status })=>{
    return (
      <div className={`w-3 h-3 rounded-full ${
        status === 'good' ? 'bg-green-500' :
        status === 'bad' ? 'bg-red-500' :
        'bg-gray-500'
      }`} />
    );
}

export default StatusCircle;