import pandas as pd
from scipy.stats import levene, linregress, shapiro, jarque_bera, kendalltau, spearmanr, mannwhitneyu
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

def kendall_correlation(df, column1, column2): # Non-parametric correlation, better than Spearman for small sample sizes
    tau_value, p_value = kendalltau(df[column1], df[column2])
    return tau_value, p_value

def spearman_correlation(df, column1, column2):
    rho_value, p_value = spearmanr(df[column1], df[column2])
    return rho_value, p_value

def pearson_correlation(df, column1, column2):
    pearsoncorr = df[[column1, column2]].corr(method='pearson')
    return pearsoncorr

def mann_whitney_test(df, column1, column2):
    group1 = df[column2][df[column1] == 1]
    group2 = df[column2][df[column1] == 2]

    stat, p_value = mannwhitneyu(group1, group2)
    print("Mann-Whitney U test: {:.4f}, p-value: {:.4f}".format(stat, p_value))
    alpha = 0.05
    if p_value < alpha:
        print('Reject the null hypothesis: There is a significant difference between the groups.')
    else:
        print('Failed to reject the null hypothesis: There is no significant difference between the groups.')
    
    plt.figure(figsize=(8, 6))
    sns.boxplot(x=column1, y=column2, data=df)
    plt.xlabel(column1)
    plt.ylabel(column2)
    plt.title("Mann-Whitney U Test")
    # sns.swarmplot(x=column1, y=column2, data=df, color=".25") # This causes a lot of warnings
    plt.show()


######################################################### Check each RQ #################################################################
def test_rq(df, independent_variable, dependent_variable, method='pearson', check_assumptions=False):
    if check_assumptions:
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
        print("Testing for correlation ...")

    if method == 'pearson':
        pearson_result = pearson_correlation(df, independent_variable, dependent_variable)
        print(pearson_result)
    elif method == 'kendall':
        tau_value, p_value = kendall_correlation(df, independent_variable, dependent_variable)
        print("Kendall's Tau value: {:.4f}, p-value: {:.4f}".format(tau_value, p_value))
    elif method == 'mann_whitney':
        mann_whitney_test(df, independent_variable, dependent_variable)
    else:
        print("Invalid method. Choose from 'pearson', 'kendall', or 'mann_whitney'.")

csv_file = "dataset.csv"
df = read_csv(csv_file)

# Make composite variables
df['GAME_EXP_COMP'] = df['GAME_EXP']*0.75 + df['GAME_EXP_HOUR']*0.25
df['PROG_EXP_COMP'] = df['PROG_EXP']*0.5 + df['PROG_EXP_YEAR']*0.25 + df['PROG_EXP_HOUR']*0.25 

# Normalise the variables
df['MOT_MEAN_NORM'] = ((df['MOT_MEAN'] - df['MOT_MEAN'].min()) / (df['MOT_MEAN'].max() - df['MOT_MEAN'].min())).round(1)
df['PROG_EXP_COMP'] = ((df['PROG_EXP_COMP'] - df['PROG_EXP_COMP'].min()) / (df['PROG_EXP_COMP'].max() - df['PROG_EXP_COMP'].min())).round(1)
df['GAME_EXP_COMP'] = ((df['GAME_EXP_COMP'] - df['GAME_EXP_COMP'].min()) / (df['GAME_EXP_COMP'].max() - df['GAME_EXP_COMP'].min())).round(1)
df['USE_FREQ'] = ((df['USE_FREQ'] - df['USE_FREQ'].min()) / (df['USE_FREQ'].max() - df['USE_FREQ'].min())).round(1)
df['CONTRIB_DIFF'] = ((df['CONTRIB_DIFF'] - df['CONTRIB_DIFF'].min()) / (df['CONTRIB_DIFF'].max() - df['CONTRIB_DIFF'].min())).round(1)
print(df)

print("\n############ RQ2 ############")
print("***** PROG_EXP_COMP vs. MOT_MEAN_NORM *****")
test_rq(df, "PROG_EXP_COMP", "MOT_MEAN_NORM")
print("\n***** GAME_EXP_COMP vs. MOT_MEAN_NORM *****")
test_rq(df, "GAME_EXP_COMP", "MOT_MEAN_NORM")

print("\n############ RQ4 ############")
test_rq(df, "USE_FREQ", "CONTRIB_DIFF", method='kendall')

print("\n############ RQ5 ############")
test_rq(df, "STATEMENT", "MOT_MEAN", method='mann_whitney')