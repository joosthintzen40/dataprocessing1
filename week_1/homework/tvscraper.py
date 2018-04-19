#!/usr/bin/env python
# Name: Joost Hintzen
# data processing week 1 Homework
# tvscrapper.py
# Student number: 10434143
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""

import csv
import re
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

    # search within the division with all the series
    contents = dom.find_all(class_= "lister-item-content")
    series = []

    # extracts the 5 subcategories from every serie and puts it into a list
    for content in contents:
        tvseries = []

        # gets titles of the series
        titles = content.find('h3').find('a').text
        if not titles:
            titles = "not provided"
        tvseries.append(titles)

        # gets the rating of the series
        rating = content.find('div', class_='inline-block ratings-imdb-rating').strong.text
        if not rating:
            rating = "not provided"
        tvseries.append(rating)

        # gets the genres of the series
        genres = content.find('span', class_='genre').text.strip()
        if not genres:
            genres = "not provided"
        tvseries.append(genres)

        # gets the actors of the series
        actors = content.find_all('a', href=re.compile('name'))
        if not actors:
            actors = "not provided"
        else:
            actorlist = []
            for actor in actors:
                actorlist.append(actor.text)
                actors = ', '.join(actorlist)
        tvseries.append(actors)

        # gets the runtime of every serie
        runtime = content.find('span', class_='runtime').text
        if not runtime:
            runtime = "not provided"
        else:
            runtime_series = runtime.split(" ")[0]
        tvseries.append(runtime_series)

        # appends the list of every serie into a list of series
        series.append(tvseries)

    # returns the list of series
    return series


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """

    # write csv file
    writer = csv.writer(outfile)

    # converts csv into format excel
    writer.writerow(["sep=,"])

    # writes the head rows
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # writes the series in rows
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
