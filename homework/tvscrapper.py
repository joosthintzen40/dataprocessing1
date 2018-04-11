#!/usr/bin/env python
# Name: Joost Hintzen
# Student number: 10434143
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    """
    Extract a list of highest rated TV series from DOM (of IMDB page).
    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    contents = dom.find_all(class_= "lister-item-content")
    series = []
    for content in contents:
        tvseries = []

        titles = content.find('h3').find('a').text
        tvseries.append(titles)


        rating = content.find('span', class_='value').text
        tvseries.append(rating)


        actors = content.find_all('p')[2].find_all("a")
        actorlist = []
        for actor in actors:
            actorlist.append(actor.text)
        tvseries.append(', '.join(actorlist))

        genres = content.find('span', class_='genre')
        tvseries.append(genres.text.strip())


        runtime = content.find('span', class_='runtime')
        tvseries.append(runtime.text)


        series.append(tvseries)

    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.

    return series


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """
    writer = csv.writer(outfile)

    writer.writerow(["sep=,"])

    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])
    for row in tvseries:
        writer.writerow(row)

def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)
        # write the CSV file to disk (including a header)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, tvseries)

    #print(output_file)
