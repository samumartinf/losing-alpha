import * as charts from 'echarts';

export function echarts(node: HTMLElement, option: echarts.EChartsOption) {
	const chart = charts.init(node);
	chart.setOption(option);
}
