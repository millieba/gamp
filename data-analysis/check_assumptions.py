import pandas as pd
from scipy.stats import levene
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import linregress
from scipy.stats import shapiro
from scipy.stats import jarque_bera
import os

######################################################### Check linearity ###############################################################
def plot_linearity(csv_file, x_column, y_column):
    # Check that the relationship between X and the mean of Y is linear
    df = pd.read_csv(csv_file)

    # Calculate the mean of Y for each unique value of X
    mean_y_by_x = df.groupby(x_column)[y_column].mean().reset_index()

    # Scatter plot
    sns.scatterplot(x=x_column, y=y_column, data=df, label='Individual Data Points')

    # Regression line
    slope, intercept, r_value, p_value, std_err = linregress(df[x_column], df[y_column])
    line = slope * df[x_column] + intercept
    plt.plot(df[x_column], line, color='red', label='Regression Line')

    # Mean of Y for each X
    plt.scatter(mean_y_by_x[x_column], mean_y_by_x[y_column], color='green', marker='o', s=200, label='Mean of Y for each X')

    plt.title(f'Scatter Plot and Regression Line\n {y_column} vs. {x_column}')
    plt.xlabel(x_column)
    plt.ylabel(y_column)
    plt.legend()
    plt.show()


######################################################### Check homoscedasticity ########################################################
def levene_test(csv_file, group_column, value_column):
    df = pd.read_csv(csv_file)
    groups = df.groupby(group_column)

    for name, group in groups:
        print(name) 
        print(str(group[value_column]) + "\n")

    # Filter out groups with very small variance
    filtered_data = []
    for name, group in groups:
        if group[value_column].var() > 1e-10:  # Check for variance greater than a small tolerance
            filtered_data.append(group[value_column])

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

def plot_homoscedasticity(csv_file, group_column, value_column):
    df = pd.read_csv(csv_file)
    groups = df.groupby(group_column)
    
    unique_group_values = sorted(df[group_column].unique()) # Needed to get right order on x-axis
    data_list = [group[value_column].values for name, group in groups] # List to hold the data for each group value
    
    plt.figure(figsize=(8, 6))
    plt.boxplot(data_list, labels=unique_group_values)
    plt.xlabel(group_column)
    plt.ylabel(value_column)
    plt.title("Homoscedasticity Plot")
    plt.show()


######################################################### Check normality ###############################################################
def shapiro_wilk_test(csv_file, column_name):
    df = pd.read_csv(csv_file)
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
def jarque_bera_test(csv_file, column_name): 
    df = pd.read_csv(csv_file)
    column_data = df[column_name]
    p_value = jarque_bera(column_data).pvalue

    alpha = 0.05
    if p_value > alpha:
        result = column_name + " data appears to be normally distributed (p-value = {:.4f})".format(p_value)
    else:
        result = column_name + " does not appear to be normally distributed (p-value = {:.4f})".format(p_value)
    
    print(result)
    return result

def plot_histogram(csv_file, column_name):
    data_frame = pd.read_csv(csv_file)
    column_data = data_frame[column_name]
    
    # Make a histogram of the data (showing the frequency of each value)
    plt.hist(column_data)
    plt.xlabel(column_name)
    plt.ylabel('Frequency')
    plt.show()


######################################################### Check each RQ #################################################################
csv_file = "cleaned.csv"

def test_rq(independent_variable, dependent_variable):
    print("Testing for linearity ...")
    plot_linearity(csv_file, independent_variable, dependent_variable)
    print("Testing for homoscedasticity ...")
    levene_test(csv_file, independent_variable, dependent_variable)
    plot_homoscedasticity(csv_file, independent_variable, dependent_variable)

    # We need to do the normality test for each group and the dependent variable separately
    unique_group_values = sorted(pd.read_csv(csv_file)[independent_variable].unique())
    for group_value in unique_group_values:
        group_indices = pd.read_csv(csv_file)[independent_variable] == group_value
        group_data = pd.read_csv(csv_file)[group_indices]
        group_data.to_csv("temp.csv", index=False) # Write the data for the current group to a temporary csv file
        print(f"Testing for normality for {dependent_variable} and {independent_variable} = {group_value} ...")
        jarque_bera_test("temp.csv", dependent_variable)
        plot_histogram("temp.csv", dependent_variable)
        os.remove("temp.csv")

def test_rq_for_masters(independent_variable, dependent_variable):
    print("Testing for linearity ...")
    plot_linearity(csv_file, independent_variable, dependent_variable)
    print("Testing for homoscedasticity with dependent variable as independent variable ...")
    levene_test(csv_file, dependent_variable, independent_variable)
    plot_homoscedasticity(csv_file, dependent_variable, independent_variable)
    print("Testing for homoscedasticity as normal ...")
    levene_test(csv_file, independent_variable, dependent_variable)
    plot_homoscedasticity(csv_file, independent_variable, dependent_variable)
    print("Testing for normality ...")
    shapiro_wilk_test(csv_file, dependent_variable)
    plot_histogram(csv_file, dependent_variable)
    shapiro_wilk_test(csv_file, independent_variable)
    plot_histogram(csv_file, independent_variable) 

print("Testing parametric assumptions RQ2 ...")
test_rq_for_masters("PROG_EXP_COMPOSITE", "MOTIVATION_MEAN")