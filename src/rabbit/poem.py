import markovify
import requests 


if __name__ == '__main__':
    response = requests.get('http://nuc:8080/api/blob')
    response.raise_for_status()

    text_model = markovify.text(response.text)

    for i in range(5):
        print(text_model.make_sentence())