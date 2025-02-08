<script>
    
	const option = {
		xAxis: {
			type: 'category',
			data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		},
		yAxis: {
			type: 'value'
		},
		series: [
			{
				data: [150, 230, 224, 218, 135, 147, 260],
				type: 'line'
			}
		]
	};
</script>

<div class="container" use:echarts={option}></div>

<style>
	.container {
		width: 500px;
		height: 500px;
	}
</style>