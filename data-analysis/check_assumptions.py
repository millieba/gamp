import pandas as pd
from scipy.stats import levene, linregress, shapiro, jarque_bera
import matplotlib.pyplot as plt
import seaborn as sns

def read_csv(csv_file):
    return pd.read_csv(csv_file)

######################################################### Check linearity ###############################################################
def plot_linearity(df, x_column, y_column):
    # Calculate the mean of Y for each unique value of X
    mean_y_by_x = df.groupby(x_column)[y_column].mean().reset_index()

    # Scatter plot
    sns.scatterplot(x=x_column, y=y_column, data=df, label='Individual Data Points')

    # Regression line
    slope, intercept, _, _, _ = linregress(df[x_column], df[y_column])
    line = slope * df[x_column] + intercept
    plt.plot(df[x_column], line, color='red', label='Regression Line')

    # Mean of Y for each X
    plt.scatter(mean_y_by_x[x_column], mean_y_by_x[y_column], color='green', marker='o', s=200, label='Mean of Y for each X')

    plt.title(f'Scatter Plot and Regression Line\n {y_column} vs. {x_column}')
    plt.xlabel(x_column)
    plt.ylabel(y_column)
    plt.legend(loc='lower right')  # Place the legend in the bottom right corner
    plt.show()

def normalize_value(value, min_value, max_value):
    return (value - min_value) / (max_value - min_value)


######################################################### Check homoscedasticity ########################################################
def levene_test(df, group_column, value_column):
    groups = df.groupby(group_column)
    filtered_data = [group[value_column] for _, group in groups if group[value_column].var() > 1e-10] # Filter out groups with very small variance

    if len(filtered_data) < 2:
        print("Error: Not enough data to perform Levene test")
        return None

    p_value = levene(*filtered_data).pvalue
    alpha = 0.05
    if p_value > alpha:
        result = "Homoscedasticity is supported (p-value = {:.4f})".format(p_value)
    else:
        result = "Homoscedasticity is not supported (p-value = {:.4f})".format(p_value)
    
    print(result)
    return result

def plot_homoscedasticity(df, group_column, value_column):
    unique_group_values = sorted(df[group_column].unique()) # Needed to get right order on x-axis
    data_list = [group[value_column].values for _, group in df.groupby(group_column)] # List to hold the data for each group value
    
    plt.figure(figsize=(8, 6))
    plt.boxplot(data_list, labels=unique_group_values)
    plt.xlabel(group_column)
    plt.ylabel(value_column)
    plt.title("Homoscedasticity Plot")
    plt.show()


######################################################### Check normality ###############################################################
def shapiro_wilk_test(df, column_name):
    column_data = df[column_name]
    p_value = shapiro(column_data).pvalue

    alpha = 0.05 # If p-value is less than this, we reject the null hypothesis (i.e. data does not appear to be normally distributed)
    if p_value > alpha:
        result = column_name + " data appears to be normally distributed (p-value = {:.4f})".format(p_value)
    else:
        result = column_name + " does not appear to be normally distributed (p-value = {:.4f})".format(p_value)
    
    print(result)
    return result

# Jarque-Bera test should be used if sample size is greater than 2000, as Shapiro-Wilk test is not reliable for large sample sizes
# https://www.statology.org/jarque-bera-test-python/
def jarque_bera_test(df, column_name): 
    column_data = df[column_name]
    p_value = jarque_bera(column_data).pvalue

    alpha = 0.05
    if p_value > alpha:
        result = column_name + " data appears to be normally distributed (p-value = {:.4f})".format(p_value)
    else:
        result = column_name + " does not appear to be normally distributed (p-value = {:.4f})".format(p_value)
    
    print(result)
    return result

def plot_histogram(df, column_name):
    column_data = df[column_name]
    # Make a histogram of the data (showing the frequency of each value)
    plt.hist(column_data)
    plt.xlabel(column_name)
    plt.ylabel('Frequency')
    plt.show()


######################################################### Check each RQ #################################################################
def test_rq(df, independent_variable, dependent_variable):
    print("Testing for linearity ...")
    plot_linearity(df, independent_variable, dependent_variable)
    print("Testing for homoscedasticity ...")
    levene_test(df, independent_variable, dependent_variable)
    plot_homoscedasticity(df, independent_variable, dependent_variable)
    print("Testing for normality ...")
    shapiro_wilk_test(df, dependent_variable)
    plot_histogram(df, dependent_variable)
    shapiro_wilk_test(df, independent_variable)
    plot_histogram(df, independent_variable) 

csv_file = "dataset.csv"
df = read_csv(csv_file)

# Make composite variables
df['GAME_EXP_COMP'] = df['GAME_EXP']*0.75 + df['GAME_EXP_HOUR']*0.25
df['PROG_EXP_COMP'] = df['PROG_EXP']*0.5 + df['PROG_EXP_YEAR']*0.25 + df['PROG_EXP_HOUR']*0.25 

# Normalise the variables
df['PROG_EXP_COMP'] = ((df['PROG_EXP_COMP'] - df['PROG_EXP_COMP'].min()) / (df['PROG_EXP_COMP'].max() - df['PROG_EXP_COMP'].min())).round(1)
df['MOT_MEAN'] = ((df['MOT_MEAN'] - df['MOT_MEAN'].min()) / (df['MOT_MEAN'].max() - df['MOT_MEAN'].min())).round(1)
df['GAME_EXP_COMP'] = ((df['GAME_EXP_COMP'] - df['GAME_EXP_COMP'].min()) / (df['GAME_EXP_COMP'].max() - df['GAME_EXP_COMP'].min())).round(1)
df['USE_FREQ'] = ((df['USE_FREQ'] - df['USE_FREQ'].min()) / (df['USE_FREQ'].max() - df['USE_FREQ'].min())).round(1)
df['CONTRIB_DIFF'] = ((df['CONTRIB_DIFF'] - df['CONTRIB_DIFF'].min()) / (df['CONTRIB_DIFF'].max() - df['CONTRIB_DIFF'].min())).round(1)
print(df)

print("############ RQ2 ############")
print("*** PROG_EXP_COMP vs. MOT_MEAN ***")
test_rq(df, "PROG_EXP_COMP", "MOT_MEAN")
print("*** GAME_EXP_COMP vs. MOT_MEAN ***")
test_rq(df, "GAME_EXP_COMP", "MOT_MEAN")
# test_rq(df, "STATEMENT", "MOT_MEAN")

print("############ RQ4 ############")
test_rq(df, "USE_FREQ", "CONTRIB_DIFF")