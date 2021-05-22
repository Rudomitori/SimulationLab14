<template>
  <main class="tile is-ancestor is-vertical m-0">
    <div class="tile is-parent">
      <div class="tile is-child field has-addons box">
        <div class="control">
          <span class="button is-static">Среднее:</span>
        </div>

        <div class="control">
          <input class="input" v-model="mean" type="number" placeholder="Среднее" increment="0.5"/>
        </div>

        <div class="control">
          <span class="button is-static">Дисперсия:</span>
        </div>

        <div class="control">
          <input class="input" v-model="variance" type="number" placeholder="Дисперсия" min="0" increment="0.5"/>
        </div>

        <div class="control">
          <span class="button is-static">Кол-во экспериментов:</span>
        </div>

        <div class="control">
          <input class="input" v-model="N" type="number" placeholder="N" min="0"/>
        </div>

        <div class="control">
          <button class="button is-primary" @click="calculate">
            Запуск
          </button>
        </div>
      </div>
    </div>
    <div class="tile is-parent">
      <div class="tile is-child panel">
        <p class="panel-heading">
          {{Calculated.N}} экспериментов для нормального распределения
        </p>
        <div class="panel-block">
          <h2>
            Среднее: {{ format(Calculated.average) }} ({{ format(Math.abs(Calculated.average - Calculated.mean) / Calculated.mean * 100)}}%)
          </h2>
        </div>
        <div class="panel-block">
          <h2>
            Дисперсия: {{ format(Calculated.empiricVariance) }} ({{format(Math.abs(Calculated.variance - Calculated.empiricVariance) / Calculated.variance * 100)}}%)
          </h2>
        </div>
        <div class="panel-block">
          <h2>
            {{
              Calculated.chiSquare > Approximate(0.05, Calculated.arr.length)
                  ? `Хи-квадрат: ${format(Calculated.chiSquare)} > ${format(Approximate(0.05, Calculated.arr.length))}`
                  : `Хи-квадрат: ${format(Calculated.chiSquare)} < ${format(Approximate(0.05, Calculated.arr.length))}`
            }}
          </h2>
        </div>
        <div class="panel-block">
          <main-chart class="container" :arr="Calculated.arr"/>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from "vue"
import MainChart from "./components/MainChart.vue"
import {getNormal, getNormalProbability} from "./domain/NormalDistribution";

export default Vue.extend({
  components: {MainChart},
  data() {
    return {
      mean: 5,
      variance: 2.5,
      N: 10,
      Calculated: {
        arr: [] as { a: number, b: number, n: number }[],
        N: 0,
        max: 0,
        min: 0,
        mean: 0,
        average: 0,
        variance: 0,
        empiricVariance: 0,
        chiSquare: 0
      }
    }
  },
  methods: {
    calculate: function () {
      if(typeof (this.mean) === "string"){
        this.mean = Number.parseFloat(this.mean as string)
      }
      if(typeof (this.variance) === "string"){
        this.variance = Number.parseFloat(this.variance as string)
      }

      let numbers: number[] = []
      numbers.length = this.N
      let min = Infinity
      let max = -Infinity

      for (let i = 0; i < this.N; i++) {
        let x = getNormal() * this.variance + this.mean
        numbers[i] = x
        if (x > max) max = x
        if (x < min) min = x
      }
      min -= 0.01
      max += 0.01

      let k = Math.ceil(Math.log2(this.N)) + 1
      let len = (max - min) / k
      let res: { a: number, b: number, n: number }[] = []
      for (let i = 0; i < k; i++) res[i] = {
        a: min + len * i,
        b: min + len * i + len,
        n: 0
      }

      for (let i = 0; i < this.N; i++) {
        let j = Math.floor((numbers[i] - min) / len)
        res[j].n++
      }

      let mean = this.mean
      let average = 0
      for (let x of numbers) {
        average += x / this.N
      }

      let variance = this.variance
      let empiricVariance = 0
      for (let x of numbers) {
        empiricVariance += Math.pow(x - average, 2) / this.N
      }

      let chiSquare = -this.N
      for (let x of res) {
        chiSquare += Math.pow(x.n, 2) / this.N
            / getNormalProbability([(x.a - this.mean) / this.variance, (x.b - this.mean) / this.variance])
      }

      for(let x of res) {
        x.n /= this.N
      }

      this.Calculated.max = max
      this.Calculated.arr = res
      this.Calculated.N = this.N
      this.Calculated.mean = mean
      this.Calculated.average = average
      this.Calculated.variance = variance
      this.Calculated.empiricVariance = empiricVariance
      this.Calculated.chiSquare = chiSquare
    },
    format: new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 2
    }).format,
    Approximate(alpha: number, k: number)
    {
      alpha = 1 - alpha
      // https://ru.wikipedia.org/wiki/%D0%9A%D0%B2%D0%B0%D0%BD%D1%82%D0%B8%D0%BB%D0%B8_%D1%80%D0%B0%D1%81%D0%BF%D1%80%D0%B5%D0%B4%D0%B5%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F_%D1%85%D0%B8-%D0%BA%D0%B2%D0%B0%D0%B4%D1%80%D0%B0%D1%82
      let n = k - 1
      let d = 0
      if (alpha >= 0.5 && alpha < 1) {
        d = 2.0637 * Math.pow(Math.log(1 / (1 - alpha)) - 0.16, 0.4274) - 1.5774
      }
      else if (alpha >= 0.001 && alpha < 0.5) {
        d = -2.0637 * Math.pow(Math.log(1 / alpha) - 0.16, 0.4274) + 1.5774
      }

      let A = d * Math.sqrt(2)
      let B = 2.0 / 3 * (d * d - 1)
      let C = d * (d * d - 7) / 9 / Math.sqrt(2)
      let D = (6 * Math.pow(d, 4) + 14 * d * d - 32) / 405
      let E = d * (9 * Math.pow(d, 4) + 256 * d * d - 433) / 4860 / Math.sqrt(2)
      return n + A * Math.sqrt(n) + B + C / Math.sqrt(n) + D / n + E / n / Math.sqrt(n)
    }
  }
});
</script>