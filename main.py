
from typing import List 


def get_filtered_number_from_string(lover1: str, lover2: str) -> List[int]:
    lover1 = lover1.strip().replace(' ','').lower()
    lover2 = lover2.strip().replace(' ','').lower()
    dash_love_dash = lover1 + "love" + lover2
    filtered_chars = []
    filtered_ints = []
    for _char in dash_love_dash:
        if _char in filtered_chars:
            continue 
        filtered_chars.append(_char)
        filtered_ints.append(dash_love_dash.count(_char))
    return filtered_ints

def get_percentage_from_filtered_ints(filtered_ints: List[str]) -> int:
    print(filtered_ints)
    if len(filtered_ints) == 1:
        return f"{sum(filtered_ints)}%"
    if len(filtered_ints) == 2 and filtered_ints[-1] == 0:
        return f"{str(filtered_ints[0])+str(filtered_ints[1])}%"
    if len(filtered_ints) == 2 and sum(filtered_ints) < 10:
        return f"{sum(filtered_ints)}%"
    if len(filtered_ints) == 2:
        return f"{str(filtered_ints[0])+str(filtered_ints[1])}%"
    length = len(filtered_ints)
    half_of_len = length // 2 
    new_filtered_ints = []
    for i in range(half_of_len):
        sum_of_two_end = filtered_ints[i]+filtered_ints[-1*(i+1)]
        if sum_of_two_end//10 == 1:
            new_filtered_ints.append(1)
            new_filtered_ints.append(sum_of_two_end%10)
        else:
            new_filtered_ints.append(sum_of_two_end)
        if i == half_of_len-1 and length %2 == 1:
            new_filtered_ints.append(filtered_ints[i+1])
            break
    
    return get_percentage_from_filtered_ints(new_filtered_ints)


if __name__ == "__main__":
    your_name = input()
    lover_name = input()
    
    filtered_ints = get_filtered_number_from_string(your_name, lover_name)
    love_percentage = get_percentage_from_filtered_ints(filtered_ints)
    print(love_percentage)
    
    