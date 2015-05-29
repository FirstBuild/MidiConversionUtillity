for /r %%G in (input\*.mid) do midicsv %%G input\%%~nG.csv
for /r %%G in (input\*.csv) do node new_csv.js %%G %1 > output\%%~nG.csv
del input\*.csv
