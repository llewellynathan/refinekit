import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/refiner.js',
      format: 'iife',
      name: 'Refiner',
      sourcemap: true,
    },
    {
      file: 'dist/refiner.mjs',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    terser(),
  ],
};
