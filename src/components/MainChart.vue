<template>
  <vue-apex-charts type="line" height="350" :options="chartOptions" :series="series"></vue-apex-charts>
</template>

<script lang="ts">
import Vue, {PropType} from "vue";
import VueApexCharts from "vue-apexcharts";


export default Vue.extend({
  props: {
    arr: Array as PropType<{ a: number, b: number, n: number }[]>,
    labels: Array as PropType<string[]>
  },
  components: {
    VueApexCharts,
  },
  computed: {
    series() {
      return [{
          name: "Распределение",
          data: this.arr.map(value => value.n),
          type: 'bar'
        },
        {
          name: "Плотность",
          data: this.arr.map(value => value.n),
          type: 'line',
          color: "#FEB019"
        }]
    },
    chartOptions() {
      return {
        chart: {
          height: 350,
          type: 'bar'
        },
        dataLabels: {
          enabled: false
        },
        plotOptions: {
          bar: {
            columnWidth: "100%"
          }
        },
        stroke: {
          curve: 'smooth'
        },
        title: {
          text: 'Нормальное распределение',
          align: 'center'
        },
        labels: this.arr.map(value => `(${this.format(value.a)}; ${this.format(value.b)}]`),
      }
    }
  },
  methods:{
    format: new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 2
    }).format,
  }
})
</script>